#!/bin/bash

HCP_API_TOKEN=$(curl --location "https://auth.idp.hashicorp.com/oauth2/token" \
--header "Content-Type: application/x-www-form-urlencoded" \
--data-urlencode "client_id=$HCP_CLIENT_ID" \
--data-urlencode "client_secret=$HCP_CLIENT_SECRET" \
--data-urlencode "grant_type=client_credentials" \
--data-urlencode "audience=https://api.hashicorp.cloud" | jq -r .access_token)
while IFS='=' read -r name value; do
    export "$name"="$value"
done < <(curl \
--location "https://api.cloud.hashicorp.com/secrets/2023-11-28/organizations/509ea6df-23ac-4229-832a-2ebc66e2951d/projects/4cd6ce46-eb7c-4aca-a694-027559ea44be/apps/ascension/secrets:open" \
--request GET \
--header "Authorization: Bearer $HCP_API_TOKEN" | jq -r '.secrets[] | "\(.name)=\(.static_version.value)"')
export AUTH_SALT=$(head -c64 </dev/urandom|xxd -p)
