#!/bin/bash

echo "=========================================="
echo "Apps SDK Integration Test Suite"
echo "=========================================="
echo ""

BASE_URL="http://localhost:5000"

# Test 1: get_rmf_funds with _meta field
echo "Test 1: get_rmf_funds - Checking for _meta field"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_funds",
      "arguments": {"page": 1, "pageSize": 3}
    }
  }')

# Check if _meta exists
if echo "$RESPONSE" | jq -e '.result._meta' > /dev/null 2>&1; then
  echo "✅ _meta field found"

  # Check for openai/outputTemplate
  TEMPLATE=$(echo "$RESPONSE" | jq -r '.result._meta["openai/outputTemplate"]')
  if [ "$TEMPLATE" == "ui://fund-list" ]; then
    echo "✅ openai/outputTemplate: $TEMPLATE"
  else
    echo "❌ Missing or incorrect openai/outputTemplate"
  fi

  # Check for funds data in _meta
  FUNDS_COUNT=$(echo "$RESPONSE" | jq '.result._meta.funds | length')
  if [ "$FUNDS_COUNT" -gt 0 ]; then
    echo "✅ Widget data present: $FUNDS_COUNT funds"
  else
    echo "❌ No funds data in _meta"
  fi
else
  echo "❌ _meta field NOT found"
fi
echo ""

# Test 2: get_rmf_fund_detail with _meta field
echo "Test 2: get_rmf_fund_detail - Checking for _meta field"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_fund_detail",
      "arguments": {"fundCode": "ABAPAC-RMF"}
    }
  }')

if echo "$RESPONSE" | jq -e '.result._meta' > /dev/null 2>&1; then
  echo "✅ _meta field found"

  TEMPLATE=$(echo "$RESPONSE" | jq -r '.result._meta["openai/outputTemplate"]')
  if [ "$TEMPLATE" == "ui://fund-detail" ]; then
    echo "✅ openai/outputTemplate: $TEMPLATE"
  else
    echo "❌ Missing or incorrect openai/outputTemplate"
  fi

  # Check for fundData in _meta
  FUND_NAME=$(echo "$RESPONSE" | jq -r '.result._meta.fundData.fund_name')
  if [ "$FUND_NAME" != "null" ] && [ -n "$FUND_NAME" ]; then
    echo "✅ Widget data present: $FUND_NAME"
  else
    echo "❌ No fundData in _meta"
  fi
else
  echo "❌ _meta field NOT found"
fi
echo ""

# Test 3: search_rmf_funds with _meta field
echo "Test 3: search_rmf_funds - Checking for _meta field"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_rmf_funds",
      "arguments": {"search": "Bualuang", "limit": 5}
    }
  }')

if echo "$RESPONSE" | jq -e '.result._meta' > /dev/null 2>&1; then
  echo "✅ _meta field found"

  TEMPLATE=$(echo "$RESPONSE" | jq -r '.result._meta["openai/outputTemplate"]')
  if [ "$TEMPLATE" == "ui://fund-list" ]; then
    echo "✅ openai/outputTemplate: $TEMPLATE"
  else
    echo "❌ Missing or incorrect openai/outputTemplate"
  fi

  FUNDS_COUNT=$(echo "$RESPONSE" | jq '.result._meta.funds | length')
  if [ "$FUNDS_COUNT" -gt 0 ]; then
    echo "✅ Widget data present: $FUNDS_COUNT funds"
  else
    echo "❌ No funds data in _meta"
  fi
else
  echo "❌ _meta field NOT found"
fi
echo ""

# Test 4: get_rmf_fund_performance with _meta field
echo "Test 4: get_rmf_fund_performance - Checking for _meta field"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_fund_performance",
      "arguments": {"period": "ytd", "limit": 5}
    }
  }')

if echo "$RESPONSE" | jq -e '.result._meta' > /dev/null 2>&1; then
  echo "✅ _meta field found"

  TEMPLATE=$(echo "$RESPONSE" | jq -r '.result._meta["openai/outputTemplate"]')
  if [ "$TEMPLATE" == "ui://fund-list" ]; then
    echo "✅ openai/outputTemplate: $TEMPLATE"
  else
    echo "❌ Missing or incorrect openai/outputTemplate"
  fi

  FUNDS_COUNT=$(echo "$RESPONSE" | jq '.result._meta.funds | length')
  if [ "$FUNDS_COUNT" -gt 0 ]; then
    echo "✅ Widget data present: $FUNDS_COUNT top performers"
  else
    echo "❌ No funds data in _meta"
  fi
else
  echo "❌ _meta field NOT found"
fi
echo ""

# Test 5: compare_rmf_funds with _meta field
echo "Test 5: compare_rmf_funds - Checking for _meta field"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "compare_rmf_funds",
      "arguments": {"fundCodes": ["ABAPAC-RMF", "ABGDD-RMF"]}
    }
  }')

if echo "$RESPONSE" | jq -e '.result._meta' > /dev/null 2>&1; then
  echo "✅ _meta field found"

  TEMPLATE=$(echo "$RESPONSE" | jq -r '.result._meta["openai/outputTemplate"]')
  if [ "$TEMPLATE" == "ui://fund-comparison" ]; then
    echo "✅ openai/outputTemplate: $TEMPLATE"
  else
    echo "❌ Missing or incorrect openai/outputTemplate"
  fi

  FUNDS_COUNT=$(echo "$RESPONSE" | jq '.result._meta.funds | length')
  if [ "$FUNDS_COUNT" -eq 2 ]; then
    echo "✅ Widget data present: Comparing $FUNDS_COUNT funds"
  else
    echo "❌ Incorrect fund count in _meta"
  fi
else
  echo "❌ _meta field NOT found"
fi
echo ""

# Test 6: Check content array format
echo "Test 6: Verifying content array structure"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 6,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_funds",
      "arguments": {"page": 1, "pageSize": 2}
    }
  }')

CONTENT_LENGTH=$(echo "$RESPONSE" | jq '.result.content | length')
if [ "$CONTENT_LENGTH" -eq 2 ]; then
  echo "✅ Content array has 2 items (text summary + JSON data)"

  # Check first item is text
  TYPE_1=$(echo "$RESPONSE" | jq -r '.result.content[0].type')
  if [ "$TYPE_1" == "text" ]; then
    echo "✅ First content item is text (summary)"
  else
    echo "❌ First content item type: $TYPE_1"
  fi

  # Check second item is text (JSON)
  TYPE_2=$(echo "$RESPONSE" | jq -r '.result.content[1].type')
  if [ "$TYPE_2" == "text" ]; then
    echo "✅ Second content item is text (JSON data)"
  else
    echo "❌ Second content item type: $TYPE_2"
  fi
else
  echo "❌ Content array length: $CONTENT_LENGTH (expected 2)"
fi
echo ""

# Test 7: Widget data structure validation
echo "Test 7: Validating widget data structure"
RESPONSE=$(curl -s -X POST "${BASE_URL}/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 7,
    "method": "tools/call",
    "params": {
      "name": "get_rmf_fund_detail",
      "arguments": {"fundCode": "ABAPAC-RMF"}
    }
  }')

# Check required widget fields
REQUIRED_FIELDS=("symbol" "fund_name" "nav_value" "risk_level")
MISSING_FIELDS=0

for FIELD in "${REQUIRED_FIELDS[@]}"; do
  VALUE=$(echo "$RESPONSE" | jq -r ".result._meta.fundData.$FIELD")
  if [ "$VALUE" != "null" ] && [ -n "$VALUE" ]; then
    echo "✅ Field present: $FIELD = $VALUE"
  else
    echo "❌ Field missing: $FIELD"
    ((MISSING_FIELDS++))
  fi
done

if [ $MISSING_FIELDS -eq 0 ]; then
  echo "✅ All required widget fields present"
else
  echo "❌ Missing $MISSING_FIELDS required fields"
fi
echo ""

echo "=========================================="
echo "Apps SDK Integration Test Complete"
echo "=========================================="
