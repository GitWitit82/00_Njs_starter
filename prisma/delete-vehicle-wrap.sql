-- Delete all tasks associated with phases in the Vehicle Wrap Standard workflow
DELETE FROM "WorkflowTask"
WHERE "phaseId" IN (
    SELECT p.id 
    FROM "Phase" p
    JOIN "Workflow" w ON p."workflowId" = w.id
    WHERE w.name = 'Vehicle Wrap Standard'
);

-- Delete all phases in the Vehicle Wrap Standard workflow
DELETE FROM "Phase"
WHERE "workflowId" IN (
    SELECT id 
    FROM "Workflow"
    WHERE name = 'Vehicle Wrap Standard'
);

-- Delete the Vehicle Wrap Standard workflow
DELETE FROM "Workflow"
WHERE name = 'Vehicle Wrap Standard'; 