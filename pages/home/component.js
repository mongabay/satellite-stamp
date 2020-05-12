import React from 'react';

import StaticPage from 'layout/static-page';
import Tool from 'components/tool';

import './style.scss';

const HomePage = () => {
  return (
    <StaticPage className="p-home">
      <Tool />
    </StaticPage>
  );
};

export default HomePage;
