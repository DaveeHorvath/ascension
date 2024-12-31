## 
# ModSecurity NGINX INSTALLATION SCRIPT
##

apt-get install -y apt-utils autoconf automake build-essential git libcurl4-openssl-dev libgeoip-dev liblmdb-dev libpcre++-dev libtool libxml2-dev libyajl-dev pkgconf wget zlib1g-dev

OPT_DIR=/opt
NGINX_DIR=/etc/nginx
MODSEC_DIR=/etc/nginx/modsec
MODULES_DIR=/etc/nginx/modules

nginx -v
NGINX_STAT=$?
cd $OPT_DIR

# install libmodsecurity
git clone https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git checkout v3/master
git submodule init
git submodule update
sh build.sh
./configure
make
make install

# compile nginx connector
NGINX_VERSION=$(nginx -v 2>&1)
NGINX_VER_NO=$(echo $NGINX_VERSION | cut -d/ -f2)

cd $OPT_DIR
wget http://nginx.org/download/nginx-$NGINX_VER_NO.tar.gz || { echo "Can't download nginx archive; Exiting setup." ; exit 1; }
tar -xvf nginx-$NGINX_VER_NO.tar.gz || { echo "Archive extracted with errors, check the source; Exiting setup." ; exit 1; }
git clone https://github.com/SpiderLabs/ModSecurity-nginx
cd $OPT_DIR/nginx-$NGINX_VER_NO
./configure --with-compat --add-dynamic-module=/opt/ModSecurity-nginx
make modules
mkdir $MODULES_DIR
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

#configure nginx to use module
cd $NGINX_DIR
mkdir $MODSEC_DIR
cd $MODSEC_DIR
git clone https://github.com/coreruleset/coreruleset.git
#mv $MODSEC_DIR/coreruleset/crs-setup.conf.example $MODSEC_DIR/coreruleset/crs-setup.conf
cp /opt/ModSecurity/modsecurity.conf-recommended $MODSEC_DIR/modsecurity.conf
cp -a /opt/ModSecurity/unicode.mapping $MODSEC_DIR

# Create a new configuration file that loads these two configuration files and all the rules files"
cat > $MODSEC_DIR/main.conf <<EOL
Include /etc/nginx/modsec/modsecurity.conf
Include /etc/nginx/modsec/coreruleset/crs-setup.conf
Include /etc/nginx/modsec/coreruleset/rules/*.conf
EOL

sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/g' /etc/nginx/modsec/modsecurity.conf

cat > /etc/nginx/modules-available/ngx_http_modsecurity.conf <<EOL
load_module /etc/nginx/modules/ngx_http_modsecurity_module.so;
EOL
ln -s /etc/nginx/modules-available/ngx_http_modsecurity.conf /etc/nginx/modules-enabled/

# cleanup
rm -rf $OPT_DIR/ModSecurity  $OPT_DIR/ModSecurity-nginx  $OPT_DIR/nginx-$NGINX_VER_NO  $OPT_DIR/nginx-$NGINX_VER_NO.tar.gz

echo "Modsecurity build and configuration completed"
