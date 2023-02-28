import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import next from 'next';
import cron from 'node-cron';
import { Scheduler } from './server/bots/scheduler';
import { api } from './utils/api';
import sslRedirect from 'heroku-ssl-redirect';

// i have a next config file though, do i remove this? which one is being used?
const app = next({
  dev: true,
  conf: {
    reactStrictMode: true,
    swcMinify: true,
    i18n: {
      locales: ['en'],
      defaultLocale: 'en',
    },
  },
  quiet: false,
});

const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

dotenv.config();

(async () => {
  try {
    await app.prepare();
    const server = express();
    // const sslRedirect = require('heroku-ssl-redirect').default; // to make it work with 'require' keyword.

    server.use(sslRedirect());

    server.use(cors());
    server.use(express.urlencoded({ extended: true }));
    server.use(express.json());

    server.listen(port, (err?: any) => {
      if (err) throw err;
      console.log(`> Ready on localhost:${port} - env $development`);

      cron.schedule('*/1 * * * *', () => {
        Scheduler();
      });
    });

    server.all('*', async (req: any, res: any, next) => {
      const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`);

      if (url.protocol === 'http' && process.env.NODE_ENV === 'production') {
        res.redirect(301, `https://${url.host}${url.pathname}`);
        return;
      }

      res.setHeader('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
      // console.error('req.url', req.url);
      return handle(req, res);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
