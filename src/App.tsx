import React from 'react';
import { Layout } from 'antd';

import Router from '~routes/index';
import './styles/vendors.scss';
import './styles/style.css';

const App = () => (
  <Layout id="main" className="isBrowser">
    <Layout id="mainSidebar" />
    <Layout id="mainPage">
      <section id="mainContent">
        <main>
          <Router />
        </main>
      </section>
    </Layout>
  </Layout>
);

export default App;
