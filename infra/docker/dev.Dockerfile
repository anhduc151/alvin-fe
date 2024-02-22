FROM tekupsolution/nextjsnode18ubuntunginx:latest AS builder

WORKDIR /home/app

COPY . .

RUN ls -liahS && mv .env.dev .env

RUN pnpm config set auto-install-peers true && pnpm config set strict-peer-dependencies false && pnpm i

RUN pnpm run build

FROM tekupsolution/nextjsnode18ubuntunginx:latest AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/app

COPY package.json pnpm-workspace.yaml .env.dev ./
COPY libs ./libs/
RUN ls -lia && ls -lia ./libs/
# RUN pnpm config set auto-install-peers true && pnpm config set strict-peer-dependencies false && pnpm i --production --filter=@chainlit/react-client --include=dev \
RUN pnpm config set auto-install-peers true && pnpm config set strict-peer-dependencies false && pnpm i \
    && rm -rf /etc/nginx/sites-enabled/default \
    && mv .env.dev .env

# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /home/app/next.config.js ./
# COPY --from=builder /home/app/next-i18next.config.js ./
# COPY --from=builder /home/app/public ./public
# COPY --from=builder /home/app/src/pages ./pages
COPY --from=builder /home/app/dist /usr/share/nginx/html

# Add your nginx.conf
COPY infra/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
