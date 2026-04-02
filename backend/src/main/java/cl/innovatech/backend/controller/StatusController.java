package cl.innovatech.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public Map<String, String> getStatus() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Microservicio de Backend funcionando correctamente :D");
        response.put("enviroment", "AWS EC2 Private Subnet");
        return response;
    }
}
