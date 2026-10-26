package com.expensetracker.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Forward all non-API, non-asset requests to index.html so that React Router
 * can handle client-side navigation (e.g., page refresh on /dashboard or /expenses).
 *
 * Requests that start with /api/ or /assets/ are NOT forwarded here because
 * Spring Security intercepts them first, and static assets are served
 * directly from the classpath:/static/ directory.
 */
@Controller
public class SpaController {

    /**
     * Catch-all for browser navigation requests that are not API calls.
     * Forward to index.html so React Router can render the correct page.
     */
    @RequestMapping(value = {
            "/dashboard",
            "/expenses",
            "/income",
            "/budgets",
            "/categories",
            "/reports",
            "/settings",
            "/login",
            "/register",
            "/springboot",
    })
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
