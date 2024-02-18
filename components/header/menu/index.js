import React, { useState } from 'react';

import { TOOLS } from '../constants';
import cx from 'classnames';
import Icon from 'components/icon';

const HeaderMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="header__menu">
      <button
        type="button"
        className="--transparent btn btn-light p-0"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">open navigation menu</span>
        <Icon name="menu" className="header__menu__icon" />
      </button>
      <div
        className={cx('header__menu__mask', {
          '--open': isOpen,
          '--close': !isOpen,
        })}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={cx('header__menu__content', {
          '--open': isOpen,
          '--close': !isOpen,
        })}
        {...(!isOpen && { inert: '' })}
      >
        <div className="header__menu__content__wrap">
          <button
            type="button"
            className="--transparent header__menu__content__wrap__close-btn btn btn-light p-0"
            onClick={() => setIsOpen(false)}
          >
            <span className="sr-only">close navigation menu</span>
            <Icon name="menu-close" className="header__menu__content__wrap__close-btn__icon" />
          </button>
          <p className="header__menu__content__wrap__title">Mongabay Data Studio</p>
          <ul className="space-y-6">
            {TOOLS.map(({ name, url, id, color }) => (
              <li key={name}>
                <a target="_blank" rel="noopener noreferrer" href={url}>
                  <div
                    style={{
                      backgroundColor: color,
                    }}
                  >
                    <Icon className={cx(id === 'supply' ? '--lg' : '--md')} name={id} />
                  </div>
                  {name}
                </a>
              </li>
            ))}
          </ul>
          <div className="header__menu__content__wrap__button">
            <a
              href="https://www.mongabay.com/contact/"
              className="btn btn-dark text-white bg-black shadow-none"
            >
              Get in touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderMenu;
