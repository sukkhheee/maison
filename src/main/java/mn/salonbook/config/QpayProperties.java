package mn.salonbook.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.payment.qpay")
public class QpayProperties {

    /** QPay merchant API base URL (sandbox or production). */
    private String baseUrl = "https://merchant-sandbox.qpay.mn/v2";

    /** Merchant username issued by QPay. Empty → mock mode. */
    private String username = "";

    /** Merchant password issued by QPay. */
    private String password = "";

    /** Per-merchant invoice template code. */
    private String invoiceCode = "";

    /**
     * Public base URL of THIS service, used to construct the {@code callback_url}
     * QPay calls when a payment is settled. In dev with localhost, QPay can't
     * reach us so the frontend polls instead.
     */
    private String publicBaseUrl = "http://localhost:8080";

    public boolean isMockMode() {
        return username == null || username.isBlank()
            || password == null || password.isBlank()
            || invoiceCode == null || invoiceCode.isBlank();
    }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getInvoiceCode() { return invoiceCode; }
    public void setInvoiceCode(String invoiceCode) { this.invoiceCode = invoiceCode; }
    public String getPublicBaseUrl() { return publicBaseUrl; }
    public void setPublicBaseUrl(String publicBaseUrl) { this.publicBaseUrl = publicBaseUrl; }
}
