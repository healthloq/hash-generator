npm install
cd client
npm install
npm run build
cd ..
sudo npm install pm2 -g
pm2 list
pm2 restart healthloqdocverify
pm2 start healthloqdocverify.js --name=healthloqdocverify
pm2 log healthloqdocverify