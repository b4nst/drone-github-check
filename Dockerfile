# --------------------
# Build stage
# --------------------
FROM node:lts-alpine as builder

WORKDIR /build

COPY . .

# Prepare prod folder with node_modules
RUN mkdir prod && \
    npm ci --production && \
    mv node_modules prod/

# Build application
RUN npm install-ci-test && \
    npm run build && \
    mv app/* prod/ 

# --------------------
# Prod image
# --------------------
FROM node:lts-alpine

COPY --from=builder /build/prod app

ENTRYPOINT [ "node", "/app/index.js" ]