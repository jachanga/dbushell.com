import React, {Component} from 'react';
import ReactDOMServer from 'react-dom/server';
import {Footer, Nav} from '../components';

function createContainer(Contained, config = {}) {
  class Container extends Component {
    render() {
      return <Contained {...this.props}/>;
    }
    static renderBody(el) {
      const footerProps = {...(config.footerProps || {})};
      const navProps = {...(config.navProps || {})};
      return `
${ReactDOMServer.renderToStaticMarkup(el)}
${ReactDOMServer.renderToStaticMarkup(<Footer {...footerProps}/>)}
${ReactDOMServer.renderToStaticMarkup(<Nav {...navProps}/>)}
`;
    }
  }

  Container.displayName = Contained.displayName || Contained.name || 'Component';
  Container.defaultProps = Contained.defaultProps;
  // Container.propTypes = Contained.propTypes;

  return Container;
}

export default createContainer;
