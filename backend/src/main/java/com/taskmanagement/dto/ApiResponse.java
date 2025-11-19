package com.taskmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private T data;
    private Meta meta;
    private List<ErrorDetail> errors = new ArrayList<>();

    public ApiResponse(T data) {
        this.data = data;
        this.meta = new Meta();
    }

    public ApiResponse(T data, Meta meta) {
        this.data = data;
        this.meta = meta;
    }

    @Data
    @AllArgsConstructor
    public static class Meta {
        private String requestId;
        private OffsetDateTime timestamp;

        public Meta() {
            this.timestamp = OffsetDateTime.now();
        }
    }

    @Data
    @AllArgsConstructor
    public static class ErrorDetail {
        private String field;
        private String message;
        private String code;

        public ErrorDetail() {
        }

        public ErrorDetail(String message) {
            this.message = message;
        }
    }
}
