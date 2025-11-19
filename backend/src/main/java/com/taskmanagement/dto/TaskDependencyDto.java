package com.taskmanagement.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyDto {
    private Long id;

    @NotNull(message = "Task ID is required")
    private Long taskId;

    @NotNull(message = "Predecessor task ID is required")
    private Long predecessorTaskId;

    private String type;
    private OffsetDateTime createdAt;
}
