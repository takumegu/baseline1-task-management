package com.taskmanagement.exception;

import com.taskmanagement.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.error("Resource not found: {}", ex.getMessage());

        ApiResponse<Void> response = new ApiResponse<>();
        response.setMeta(new ApiResponse.Meta());

        ApiResponse.ErrorDetail error = new ApiResponse.ErrorDetail();
        error.setMessage(ex.getMessage());
        error.setCode("RESOURCE_NOT_FOUND");

        List<ApiResponse.ErrorDetail> errors = new ArrayList<>();
        errors.add(error);
        response.setErrors(errors);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(ValidationException ex) {
        log.error("Validation error: {}", ex.getMessage());

        ApiResponse<Void> response = new ApiResponse<>();
        response.setMeta(new ApiResponse.Meta());

        ApiResponse.ErrorDetail error = new ApiResponse.ErrorDetail();
        error.setMessage(ex.getMessage());
        error.setCode("VALIDATION_ERROR");

        List<ApiResponse.ErrorDetail> errors = new ArrayList<>();
        errors.add(error);
        response.setErrors(errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        log.error("Validation error: {}", ex.getMessage());

        ApiResponse<Void> response = new ApiResponse<>();
        response.setMeta(new ApiResponse.Meta());

        List<ApiResponse.ErrorDetail> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            ApiResponse.ErrorDetail error = new ApiResponse.ErrorDetail();
            error.setField(fieldError.getField());
            error.setMessage(fieldError.getDefaultMessage());
            error.setCode("VALIDATION_ERROR");
            errors.add(error);
        }
        response.setErrors(errors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        log.error("Internal server error", ex);

        ApiResponse<Void> response = new ApiResponse<>();
        response.setMeta(new ApiResponse.Meta());

        ApiResponse.ErrorDetail error = new ApiResponse.ErrorDetail();
        error.setMessage("An unexpected error occurred");
        error.setCode("INTERNAL_SERVER_ERROR");

        List<ApiResponse.ErrorDetail> errors = new ArrayList<>();
        errors.add(error);
        response.setErrors(errors);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
