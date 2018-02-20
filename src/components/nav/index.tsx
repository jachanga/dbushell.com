import React from 'react';
import Icon from '../icon';
import defaults from './defaults.json';

const NavItem: React.SFC<NavItemProps> = props => {
  const attr = {
    className: 'b-nav__item'
  };
  attr['data-priority'] = props.priority;
  attr['data-order'] = props.order;
  if (props.active) {
    attr.className += ' b-nav__item--active';
  }
  return (
    <li {...attr}>
      <a href={props.href} className="b-nav__link">{props.text}</a>
    </li>
  );
}

const Nav: React.SFC<NavProps> = props => {
  const {pagePath} = props;
  if (pagePath) {
    props.items.forEach(item => {
      item.active = false;
      if (item.href === pagePath) {
        item.active = true;
      }
      if (/^\/blog\//.test(item.href) && /^\/\d{4}\/\d{2}\/\d{2}\//.test(pagePath)) {
        item.active = true;
      }
    });
  }
  return (
    <nav className="b-nav" id="nav">
      <h2 className="b-nav__title u-vh">{props.heading}</h2>
      <ul className="b-nav__list" data-root="true">
        {props.items.map(item => <NavItem key={item.order} {...item}/>)}
        <li className="b-nav__item b-nav__item--icons" data-priority={props.items.length + 1} data-order={props.items.length + 1}>
          <a className="b-nav__link" rel="me noopener noreferrer" target="_blank" title="David Bushell on Twitter" href="http://twitter.com/dbushell">
            <Icon id="twitter"/>
            <span className="u-vh">@dbushell</span>
          </a>
          <a className="b-nav__link" rel="me noopener noreferrer" target="_blank" title="David Bushell on GitHub" href="https://github.com/dbushell/">
            <Icon id="github"/>
            <span className="u-vh">GitHub</span>
          </a>
          <a className="b-nav__link" rel="me noopener noreferrer" target="_blank" title="David Bushell on CodePen" href="http://codepen.io/dbushell/">
            <Icon id="codepen"/>
            <span className="u-vh">CodePen</span>
          </a>
        </li>
      </ul>
      <div className="b-nav__more">
        <button type="button" className="b-nav__link">
          <Icon id="nav"/>
        </button>
        <ul className="b-nav__dropdown"/>
      </div>
    </nav>
  );
};

Nav.defaultProps = defaults;

export default Nav;