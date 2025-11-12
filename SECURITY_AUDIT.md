# 🔒 Security Audit Report
## Thai RMF Market Pulse MCP Server

**Date:** 2025-11-12
**Version:** 1.0.0
**Auditor:** Automated Security Review

---

## Executive Summary

**Overall Security Status:** ⚠️ **MODERATE RISK**

- ✅ **0 npm vulnerabilities** (excellent)
- ✅ **Good input validation** with Zod schemas
- ⚠️ **1 HIGH severity issue** found (Path Traversal)
- ⚠️ **2 MEDIUM severity issues** found
- ⚠️ **3 LOW severity issues** found

---

## 🔴 HIGH Severity Issues

### 1. Path Traversal Vulnerability in `getNavHistory()`

**Location:** `server/services/rmfDataService.ts:283`

**Issue:**
```typescript
const jsonPath = join(process.cwd(), 'data', 'rmf-funds', `${symbol}.json`);
const fileContent = readFileSync(jsonPath, 'utf-8');
```

**Vulnerability:**
The `symbol` parameter is directly interpolated into a file path without sanitization. An attacker could use path traversal sequences like `../../etc/passwd` to read arbitrary files.

**Attack Example:**
```javascript
// Malicious input
fundCode: "../../../etc/passwd"
// Results in: /path/to/app/data/rmf-funds/../../../etc/passwd.json
```

**Impact:**
- Unauthorized file system access
- Exposure of sensitive configuration files
- Potential information disclosure

**Recommendation:**
```typescript
getNavHistory(symbol: string, days: number = 30): RMFNavHistory[] {
  // Sanitize input: only allow alphanumeric, dash, and underscore
  const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9\-_]/g, '');

  // Validate symbol exists in our fund list
  if (!this.fundsMap.has(sanitizedSymbol)) {
    console.warn(`Invalid symbol requested: ${symbol}`);
    return [];
  }

  const cacheKey = `${sanitizedSymbol}_${days}`;

  if (this.navHistoryCache.has(cacheKey)) {
    return this.navHistoryCache.get(cacheKey)!;
  }

  try {
    // Use sanitized symbol
    const jsonPath = join(process.cwd(), 'data', 'rmf-funds', `${sanitizedSymbol}.json`);
    const fileContent = readFileSync(jsonPath, 'utf-8');
    // ... rest of function
  }
}
```

---

## 🟡 MEDIUM Severity Issues

### 2. Missing Rate Limiting

**Location:** `server/index.ts:63` (POST /mcp endpoint)

**Issue:**
No rate limiting is implemented on the MCP endpoint. An attacker could overwhelm the server with requests.

**Impact:**
- Denial of Service (DoS)
- Resource exhaustion
- Increased infrastructure costs

**Recommendation:**
```typescript
import rateLimit from 'express-rate-limit';

const mcpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/mcp', mcpLimiter, async (req, res) => {
  // ... existing code
});
```

### 3. Error Messages Leak Implementation Details

**Location:** `server/index.ts:77-87`

**Issue:**
```typescript
catch (error) {
  console.error('MCP endpoint error:', error);
  if (!res.headersSent) {
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
      },
      id: null,
    });
  }
}
```

Error messages may expose stack traces or internal implementation details.

**Impact:**
- Information disclosure
- Helps attackers understand system internals

**Recommendation:**
```typescript
catch (error) {
  console.error('MCP endpoint error:', error); // Log full error internally
  if (!res.headersSent) {
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'An error occurred processing your request', // Generic message
      },
      id: null,
    });
  }
}
```

---

## 🟢 LOW Severity Issues

### 4. Missing Security Headers

**Location:** `server/index.ts` (global middleware)

**Issue:**
No security headers are set (HSTS, X-Content-Type-Options, etc.)

**Recommendation:**
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: false, // Adjust as needed
  crossOriginEmbedderPolicy: false,
}));
```

### 5. No CORS Configuration

**Location:** `server/index.ts`

**Issue:**
CORS is not configured, allowing requests from any origin.

**Impact:**
- Potential for CSRF attacks
- Uncontrolled cross-origin access

**Recommendation:**
```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: false,
};

app.use(cors(corsOptions));
```

### 6. Unbounded Input Parameters

**Location:** `server/mcp.ts:90`

**Issue:**
```typescript
const pageSize = Math.min(args?.pageSize || 20, 50);
```

While pageSize is capped at 50, other parameters like `days` in NAV history could be manipulated.

**Current:**
```typescript
days: z.number().optional().default(30).describe('Number of days of history (max: 365)')
```

**Issue:** Zod schema describes max as 365, but no validation enforces it.

**Recommendation:**
```typescript
days: z.number().min(1).max(365).optional().default(30).describe('Number of days of history (max: 365)')
```

---

## ✅ Security Strengths

### 1. Input Validation with Zod ✅
All MCP tools use Zod schemas for input validation:
- Type safety enforced
- Enum constraints for specific fields
- Min/max constraints on numeric values

### 2. No SQL Injection Risk ✅
- No database queries (uses in-memory data)
- No dynamic SQL construction

### 3. No Command Injection Risk ✅
- No shell command execution
- No use of `eval()` or similar dangerous functions

### 4. Minimal Dependencies ✅
- Only 138 npm packages (vs 548 before)
- Zero npm vulnerabilities detected

### 5. No Sensitive Data Exposure ✅
- No credentials stored in code
- API keys only in environment variables
- No PII (Personally Identifiable Information) processed

### 6. Proper Error Handling ✅
- Try-catch blocks in critical sections
- Graceful degradation on errors
- Startup fails if data cannot be loaded

---

## 🛡️ Recommendations Priority

### CRITICAL (Fix Immediately)
1. ✅ **Fix Path Traversal** - Sanitize `symbol` input in `getNavHistory()`

### HIGH (Fix Before Production)
2. ✅ **Add Rate Limiting** - Protect against DoS
3. ✅ **Sanitize Error Messages** - Prevent information leakage
4. ✅ **Add Input Validation** - Enforce max constraints on `days` parameter

### MEDIUM (Recommended)
5. ⚠️ **Add Security Headers** - Use helmet middleware
6. ⚠️ **Configure CORS** - Restrict origins explicitly
7. ⚠️ **Add Request Size Limits** - Prevent payload attacks
8. ⚠️ **Add Logging/Monitoring** - Track suspicious activity

### LOW (Nice to Have)
9. 📝 **Add CSP Headers** - Content Security Policy
10. 📝 **Add API Authentication** - If deploying publicly
11. 📝 **Add Request ID Tracking** - For audit trails
12. 📝 **Implement Health Check Alerts** - Monitor uptime

---

## 🔍 Additional Security Considerations

### For Production Deployment:

1. **Environment Variables:**
   - Use secrets management (AWS Secrets Manager, HashiCorp Vault)
   - Never commit `.env` files
   - Rotate API keys regularly

2. **HTTPS/TLS:**
   - Always use HTTPS in production
   - Use valid SSL certificates
   - Enforce TLS 1.2 or higher

3. **Monitoring:**
   - Log all requests with timestamps
   - Monitor for unusual patterns
   - Set up alerts for errors

4. **Updates:**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Subscribe to security advisories

5. **Backup:**
   - Regular backups of fund data
   - Disaster recovery plan
   - Version control for all code

---

## 📊 Risk Assessment Matrix

| Issue | Severity | Exploitability | Impact | Priority |
|-------|----------|----------------|--------|----------|
| Path Traversal | HIGH | Easy | High | P0 |
| No Rate Limiting | MEDIUM | Easy | Medium | P1 |
| Error Message Leakage | MEDIUM | Easy | Low | P1 |
| Missing Security Headers | LOW | Medium | Low | P2 |
| No CORS Configuration | LOW | Medium | Medium | P2 |
| Unbounded Parameters | LOW | Easy | Low | P2 |

---

## 🎯 Compliance Notes

**OWASP Top 10 (2021) Status:**

| Risk | Status | Notes |
|------|--------|-------|
| A01:2021 – Broken Access Control | ⚠️ | Path traversal vulnerability |
| A02:2021 – Cryptographic Failures | ✅ | No sensitive data encryption needed |
| A03:2021 – Injection | ✅ | No SQL/command injection risks |
| A04:2021 – Insecure Design | ✅ | Good architecture |
| A05:2021 – Security Misconfiguration | ⚠️ | Missing security headers |
| A06:2021 – Vulnerable Components | ✅ | No known vulnerabilities |
| A07:2021 – Identification/Authentication | N/A | No auth required currently |
| A08:2021 – Software and Data Integrity | ✅ | Good integrity checks |
| A09:2021 – Security Logging | ⚠️ | Basic logging only |
| A10:2021 – Server-Side Request Forgery | ✅ | No SSRF risks |

---

## 📝 Security Checklist for Deployment

- [ ] Fix path traversal vulnerability
- [ ] Add rate limiting middleware
- [ ] Sanitize error messages
- [ ] Add security headers (helmet)
- [ ] Configure CORS properly
- [ ] Add input validation constraints
- [ ] Set up HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting
- [ ] Document security procedures
- [ ] Conduct penetration testing
- [ ] Create incident response plan

---

## 🔗 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Zod Documentation](https://zod.dev/)

---

**Report Generated:** 2025-11-12
**Next Review:** Recommended after fixes are applied
