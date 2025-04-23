package com.university.registration.events;

import org.springframework.context.ApplicationEvent;
import com.university.registration.model.Registration;

public class RegistrationEvent extends ApplicationEvent {

    private Registration registration;
    private String eventType;

    public RegistrationEvent(Object source, Registration registration, String eventType) {
        super(source);
        this.registration = registration;
        this.eventType = eventType;
    }

    public Registration getRegistration() {
        return registration;
    }

    public String getEventType() {
        return eventType;
    }
}
