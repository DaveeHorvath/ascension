FROM debian:bullseye

RUN apt update -y \
&& apt upgrade -y \
&& apt install -y nginx

RUN mkdir -p /etc/nginx/ssl
RUN apt install openssl -y
RUN openssl req -x509 -nodes -out /etc/nginx/ssl/cert.crt -keyout /etc/nginx/ssl/key.key -subj "/C=FI/ST=Southern Finland/L=Helsinki/0=42/OU=Hive/CN=dhorvath.42.fr"

RUN mkdir -p /var/run/nginx

COPY nginx.conf /etc/nginx/nginx.conf
RUN chmod 644 /etc/nginx/nginx.conf

RUN adduser -D -H -s /sbin/nologin -g www-data -G www-data www-data 
RUN chown www-data /etc/nginx
RUN chmod 755 /var/www

COPY libModSecurity.sh ./
RUN chmod +x ./libModSecurity.sh
RUN ./libModSecurity.sh
COPY crs-setup.conf.example /etc/nginx/modsec/coreruleset/crs-setup.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
