# TODO: Fix Vector Service Connection Issue

## Steps to Complete:

- [ ] Step 1: Create vector-service/Dockerfile.dev to support dev mode with tsx (no prune dev deps).
- [ ] Step 2: Update docker-compose.dev.yml for vector service (use Dockerfile.dev, expose port 8000).
- [ ] Step 3: Update api/src/routes/trends.ts to use correct VECTOR_SERVICE_URL ('http://vector:8000').
- [ ] Step 4: Build the vector dev image (`docker compose -f docker-compose.dev.yml build vector`).
- [ ] Step 5: Start the vector service (`docker compose -f docker-compose.dev.yml up -d vector`).
- [ ] Step 6: Restart the api service (`docker compose -f docker-compose.dev.yml restart api`).
- [ ] Step 7: Verify the fix (check docker ps, logs, and test trend creation endpoint).

Progress: Starting with Step 1.
