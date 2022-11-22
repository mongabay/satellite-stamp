import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';

import './style.scss';

const COORDINATES_REGEX = /^(?<longitude>-?\d{1,}(\.\d{1,})?)(\s{1,}|\s{0,},\s{0,})(?<latitude>-?\d{1,}(\.\d{1,})?)$/;

const Search = ({ expanded: alwaysExpanded, contained, onChangeBounds, onChangeCenter }) => {
  const containerRef = useRef();
  const [expanded, setExpanded] = useState(alwaysExpanded);
  const [keyword, setKeyword] = useState('');
  const [isCoordinates, setIsCoordinates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const onSelectPlace = useCallback(
    keyword => {
      setKeyword(keyword);

      const isCoordinates = COORDINATES_REGEX.test(keyword);
      if (isCoordinates) {
        let { longitude, latitude } = keyword.match(COORDINATES_REGEX).groups;
        longitude = Number.parseFloat(longitude);
        latitude = Number.parseFloat(latitude);

        onChangeCenter([longitude, latitude]);
        setShowSuggestions(false);

        return;
      }

      geocodeByAddress(keyword)
        .then(results => {
          const { bounds, location } = results[0].geometry;

          if (bounds) {
            const NELat = bounds.getNorthEast().lat();
            const NELng = bounds.getNorthEast().lng();
            const SWLat = bounds.getSouthWest().lat();
            const SWLng = bounds.getSouthWest().lng();

            onChangeBounds([
              [SWLng, SWLat],
              [NELng, NELat],
            ]);
          } else if (location) {
            onChangeCenter([location.lng(), location.lat()]);
          }

          setShowSuggestions(false);
        })
        .catch(error => console.error(error));
    },
    [onChangeBounds, onChangeCenter]
  );

  // When the user changes mode, we want to make sure the default state of the search bar is
  // correctly applied
  useEffect(() => {
    setExpanded(alwaysExpanded);
  }, [alwaysExpanded]);

  // We listen to clicks in order to close the search bar if the user clicks outside of it (except
  // when it is always expanded)
  useEffect(() => {
    const onClick = e => {
      const container = containerRef.current;
      const target = e.target;
      // When the user clicks on a suggestion, list disappears and so the `target` is not in the DOM
      // anymore
      const outsideClick = document.contains(target) && !container.contains(target);

      if (outsideClick) {
        if (!alwaysExpanded) {
          setExpanded(false);
        }

        setShowSuggestions(false);
      }
    };

    window.addEventListener('click', onClick);

    return () => window.removeEventListener('click', onClick);
  }, [alwaysExpanded, containerRef]);

  // Detect if the user searched coordinates and set `isCoordinates`
  // Show the suggestions when the user types
  useEffect(() => {
    setIsCoordinates(COORDINATES_REGEX.test(keyword.trim()));
    setShowSuggestions(keyword.length > 0);
  }, [keyword]);

  return (
    <div
      className={classnames({
        'c-search': true,
        '-full': !contained && expanded,
        '-active': showSuggestions,
      })}
      ref={containerRef}
    >
      <button
        type="button"
        className="btn btn-light"
        // The element must not disappear from the DOM otherwise the callback listening to outside
        // click won't work properly
        hidden={expanded}
        onClick={() => setExpanded(true)}
      >
        <span className="sr-only">Search</span>
        <img
          src="/images/icon-search.svg"
          alt="Search"
          width="18"
          height="18"
          className="d-block"
        />
      </button>
      {!!expanded && (
        <PlacesAutocomplete value={keyword} onChange={setKeyword} onSelect={onSelectPlace}>
          {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <>
              <div className="position-relative">
                <input
                  // @ts-ignore
                  {...getInputProps({
                    type: 'search',
                    className: classnames({
                      'form-control': true,
                      '-suggestions': showSuggestions,
                      '-empty-btn': keyword.length > 0,
                    }),
                    'aria-label': 'Search for country, state, city, town...',
                    placeholder: 'Search for country, state, city, town...',
                    autoFocus: !alwaysExpanded,
                  })}
                />
                {keyword.length > 0 && (
                  <button type="button" className="empty-btn" onClick={() => setKeyword('')}>
                    <span className="sr-only">Empty search</span>
                    <img src="/images/icon-close.svg" alt="" />
                  </button>
                )}
                {showSuggestions && isCoordinates && (
                  <ul className="suggestions">
                    <li className="message">
                      <kbd>enter</kbd> to navigate to coordinates
                    </li>
                  </ul>
                )}
                {showSuggestions && !isCoordinates && keyword.length > 0 && (
                  <ul className="suggestions">
                    {loading && <li className="message">Loading...</li>}
                    {!loading && suggestions.length === 0 && (
                      <li className="message">No results found</li>
                    )}
                    {suggestions.map(suggestion => (
                      <li
                        key={suggestion.id}
                        {...getSuggestionItemProps(suggestion, {
                          className: suggestion.active ? '-active' : '',
                          style: { cursor: 'pointer' },
                        })}
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: suggestion.matchedSubstrings.reduce(
                              (res, { offset, length }) => {
                                const before = res.substring(0, offset);
                                const substring = res.substring(offset, offset + length);
                                const after = res.substring(offset + length, res.length);

                                return `${before}<b>${substring}</b>${after}`;
                              },
                              suggestion.formattedSuggestion.mainText
                            ),
                          }}
                        />
                        <span>{suggestion.formattedSuggestion.secondaryText}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!contained && <p>Location search applies to all maps</p>}
            </>
          )}
        </PlacesAutocomplete>
      )}
    </div>
  );
};

Search.propTypes = {
  expanded: PropTypes.bool.isRequired,
  contained: PropTypes.bool.isRequired,
  onChangeBounds: PropTypes.func.isRequired,
  onChangeCenter: PropTypes.func.isRequired,
};

export default Search;
