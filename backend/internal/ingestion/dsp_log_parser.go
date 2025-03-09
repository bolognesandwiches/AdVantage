package ingestion

import (
	"encoding/csv"
	"fmt"
	"io"
	"strconv"
	"strings"
	"time"
)

// BeeswaxLogRecord represents a parsed record from a Beeswax DSP log
type BeeswaxLogRecord struct {
	AccountID              string
	AuctionID              string
	BidPriceMicrosUSD      int64
	BidTime                time.Time
	CampaignID             string
	ClearingPriceMicrosUSD int64
	Clicks                 int
	Conversions            int
	CreativeID             string
	Domain                 string
	GeoCountry             string
	GeoCity                string
	ImpressionTime         time.Time
	PlatformDeviceType     string
	PlatformBrowser        string
	PlatformOS             string
	WinCostMicrosUSD       int64
	AdPosition             string
	UserID                 string
}

// BeeswaxLogSummary contains aggregated metrics from a DSP log file
type BeeswaxLogSummary struct {
	TotalRecords        int                        `json:"totalRecords"`
	TotalImpressions    int                        `json:"totalImpressions"`
	TotalClicks         int                        `json:"totalClicks"`
	TotalConversions    int                        `json:"totalConversions"`
	TotalBidAmount      float64                    `json:"totalBidAmount"`
	TotalWinCost        float64                    `json:"totalWinCost"`
	CTR                 float64                    `json:"ctr"`
	AverageBidPrice     float64                    `json:"averageBidPrice"`
	AverageWinRate      float64                    `json:"averageWinRate"`
	TimeRange           [2]time.Time               `json:"timeRange"`
	DeviceBreakdown     map[string]int             `json:"deviceBreakdown"`
	BrowserBreakdown    map[string]int             `json:"browserBreakdown"`
	OSBreakdown         map[string]int             `json:"osBreakdown"`
	GeoBreakdown        map[string]int             `json:"geoBreakdown"`
	HourlyBreakdown     map[string]int             `json:"hourlyBreakdown"`
	DomainBreakdown     map[string]int             `json:"domainBreakdown"`
	CampaignPerformance map[string]CampaignMetrics `json:"campaignPerformance"`
}

// CampaignMetrics contains metrics for a specific campaign
type CampaignMetrics struct {
	Impressions int     `json:"impressions"`
	Clicks      int     `json:"clicks"`
	Conversions int     `json:"conversions"`
	Spend       float64 `json:"spend"`
	CTR         float64 `json:"ctr"`
}

// ParseBeeswaxLog parses a Beeswax DSP log file and returns a summary of the data
func ParseBeeswaxLog(reader io.Reader) (*BeeswaxLogSummary, error) {
	csvReader := csv.NewReader(reader)

	// Read the header row
	header, err := csvReader.Read()
	if err != nil {
		return nil, fmt.Errorf("failed to read header: %w", err)
	}

	// Create a map from column name to index
	colMap := make(map[string]int)
	for i, col := range header {
		colMap[col] = i
	}

	// Required columns for basic analysis
	requiredCols := []string{
		"ACCOUNT_ID", "AUCTION_ID", "BID_PRICE_MICROS_USD", "BID_TIME",
		"CAMPAIGN_ID", "CLEARING_PRICE_MICROS_USD", "CLICKS", "CONVERSIONS",
		"CREATIVE_ID", "DOMAIN", "GEO_COUNTRY", "GEO_CITY",
		"PLATFORM_DEVICE_TYPE", "PLATFORM_BROWSER", "PLATFORM_OS", "WIN_COST_MICROS_USD",
	}

	// Validate that required columns exist
	for _, col := range requiredCols {
		if _, exists := colMap[col]; !exists {
			// If exact column not found, try to find a similar column (case insensitive)
			found := false
			for headerCol := range colMap {
				if strings.ToUpper(headerCol) == col {
					colMap[col] = colMap[headerCol]
					found = true
					break
				}
			}
			if !found {
				return nil, fmt.Errorf("required column not found: %s", col)
			}
		}
	}

	// Initialize the summary
	summary := &BeeswaxLogSummary{
		DeviceBreakdown:     make(map[string]int),
		BrowserBreakdown:    make(map[string]int),
		OSBreakdown:         make(map[string]int),
		GeoBreakdown:        make(map[string]int),
		HourlyBreakdown:     make(map[string]int),
		DomainBreakdown:     make(map[string]int),
		CampaignPerformance: make(map[string]CampaignMetrics),
	}

	// Initialize time range with far future and far past to ensure it gets updated
	summary.TimeRange[0] = time.Date(9999, 1, 1, 0, 0, 0, 0, time.UTC)
	summary.TimeRange[1] = time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)

	// Parse each record
	for {
		record, err := csvReader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error reading record: %w", err)
		}

		// Safely get values from record
		getValueSafely := func(colName string) string {
			idx, exists := colMap[colName]
			if !exists || idx >= len(record) {
				return ""
			}
			return record[idx]
		}

		// Parse bid time
		bidTimeStr := getValueSafely("BID_TIME")
		var bidTime time.Time
		if bidTimeStr != "" {
			var parseErr error
			bidTime, parseErr = time.Parse("2006-01-02 15:04:05.000", bidTimeStr)
			if parseErr != nil {
				// Try alternate format
				bidTime, parseErr = time.Parse("2006-01-02 15:04:05", bidTimeStr)
				if parseErr != nil {
					// Just log this error but continue processing
					fmt.Printf("Error parsing BID_TIME: %v\n", parseErr)
				}
			}
		}

		// Update time range
		if !bidTime.IsZero() {
			if bidTime.Before(summary.TimeRange[0]) {
				summary.TimeRange[0] = bidTime
			}
			if bidTime.After(summary.TimeRange[1]) {
				summary.TimeRange[1] = bidTime
			}

			// Update hourly breakdown
			hourKey := bidTime.Format("2006-01-02 15")
			summary.HourlyBreakdown[hourKey]++
		}

		// Parse bid price
		bidPriceStr := getValueSafely("BID_PRICE_MICROS_USD")
		bidPrice, _ := strconv.ParseInt(bidPriceStr, 10, 64)

		// Parse win cost
		winCostStr := getValueSafely("WIN_COST_MICROS_USD")
		winCost, _ := strconv.ParseInt(winCostStr, 10, 64)

		// Parse clicks
		clicksStr := getValueSafely("CLICKS")
		clicks, _ := strconv.Atoi(clicksStr)

		// Parse conversions
		conversionsStr := getValueSafely("CONVERSIONS")
		conversions, _ := strconv.Atoi(conversionsStr)

		// Get other fields
		campaignID := getValueSafely("CAMPAIGN_ID")
		domain := getValueSafely("DOMAIN")
		country := getValueSafely("GEO_COUNTRY")
		deviceType := getValueSafely("PLATFORM_DEVICE_TYPE")
		browser := getValueSafely("PLATFORM_BROWSER")
		os := getValueSafely("PLATFORM_OS")

		// Update summary
		summary.TotalRecords++
		summary.TotalImpressions++
		summary.TotalClicks += clicks
		summary.TotalConversions += conversions
		summary.TotalBidAmount += float64(bidPrice) / 1000000 // Convert micros to actual dollars
		summary.TotalWinCost += float64(winCost) / 1000000    // Convert micros to actual dollars

		// Update breakdowns
		if deviceType != "" {
			summary.DeviceBreakdown[deviceType]++
		}
		if browser != "" {
			summary.BrowserBreakdown[browser]++
		}
		if os != "" {
			summary.OSBreakdown[os]++
		}
		if country != "" {
			summary.GeoBreakdown[country]++
		}
		if domain != "" {
			summary.DomainBreakdown[domain]++
		}

		// Update campaign performance
		if campaignID != "" {
			campaign := summary.CampaignPerformance[campaignID]
			campaign.Impressions++
			campaign.Clicks += clicks
			campaign.Conversions += conversions
			campaign.Spend += float64(winCost) / 1000000
			summary.CampaignPerformance[campaignID] = campaign
		}
	}

	// Calculate derived metrics
	if summary.TotalRecords > 0 {
		summary.AverageBidPrice = summary.TotalBidAmount / float64(summary.TotalRecords)
	}
	if summary.TotalImpressions > 0 {
		summary.CTR = float64(summary.TotalClicks) / float64(summary.TotalImpressions) * 100
	}
	// Win rate is impressions / records (assuming each record is a bid)
	if summary.TotalRecords > 0 {
		summary.AverageWinRate = float64(summary.TotalImpressions) / float64(summary.TotalRecords) * 100
	}

	// Calculate CTR for each campaign
	for id, campaign := range summary.CampaignPerformance {
		if campaign.Impressions > 0 {
			campaign.CTR = float64(campaign.Clicks) / float64(campaign.Impressions) * 100
			summary.CampaignPerformance[id] = campaign
		}
	}

	return summary, nil
}
