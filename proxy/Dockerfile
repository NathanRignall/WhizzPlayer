FROM nginx:1.18

# add nginx config
RUN rm -v /etc/nginx/nginx.conf
ADD nginx.conf /etc/nginx/

# args
ARG VERSION_CODE