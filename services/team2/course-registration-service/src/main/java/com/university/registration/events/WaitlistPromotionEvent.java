package com.university.registration.events;

import org.springframework.context.ApplicationEvent;

import com.university.registration.model.WaitlistEntry;

public class WaitlistPromotionEvent extends ApplicationEvent {

    private final WaitlistEntry waitlistEntry;

    public WaitlistPromotionEvent(Object source, WaitlistEntry waitlistEntry) {
        super(source);
        this.waitlistEntry = waitlistEntry;
    }

    public WaitlistEntry getWaitlistEntry() {
        return waitlistEntry;
    }
}
