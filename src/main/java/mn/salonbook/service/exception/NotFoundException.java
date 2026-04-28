package mn.salonbook.service.exception;

public class NotFoundException extends RuntimeException {
    private final String resource;
    private final String identifier;

    public NotFoundException(String resource, String identifier) {
        super("%s '%s' not found".formatted(resource, identifier));
        this.resource = resource;
        this.identifier = identifier;
    }

    public String getResource() {
        return resource;
    }

    public String getIdentifier() {
        return identifier;
    }
}
