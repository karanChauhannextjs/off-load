import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import styles from './Select.module.scss';
import { OptionType, SelectProps } from './Select.types';
import useOutlier from '@shared/hooks/useOutlier.ts';

const Select: React.FC<SelectProps> = (props) => {
  const {
    value,
    onChange,
    data,
    className,
    activeClassName,
    renderItem,
    defaultValue,
    openDropdown,
    disabled,
    isSearchable,
    errorMessage,
    placeholder,
    withoutArrow = false,
  } = props;

  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<OptionType[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLUListElement>(null);
  const isOpenedStatus = openDropdown ?? isOpened;

  const outlierRef = useOutlier<HTMLDivElement>(() => setIsOpened(false));

  const defaultPlaceholder = placeholder ? placeholder : 'Select ...';

  const currentDefaultValue =
    !!defaultValue && typeof defaultValue === 'boolean'
      ? data[0]
      : defaultValue;

  const defaultValueOrPlaceholder =
    currentDefaultValue && currentDefaultValue.label
      ? currentDefaultValue.label
      : defaultPlaceholder;

  const label = !value ? defaultValueOrPlaceholder : value.label;

  const noSearchOption = !filteredData?.length;

  const handleChangeVisibility = () => {
    if (!disabled) {
      setIsOpened((prev) => !prev);
    }
  };

  const handleItemClick = (
    _event: React.MouseEvent<HTMLLIElement>,
    data: OptionType,
  ) => {
    onChange(data);
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.toLowerCase();

    if (!inputValue) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((option) => {
        const optionValue = String(option.value)
          .toLowerCase()
          .replaceAll('_', ' ');
        return optionValue.includes(inputValue);
      });
      setFilteredData(filtered);
    }
  };

  useEffect(() => {
    setFilteredData(data);
    if (!!inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpenedStatus && wrapperRef.current) {
      wrapperRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isOpenedStatus]);

  return (
    <div
      className={cn(
        styles.wrapper,
        {
          [styles.active]: isOpenedStatus,
          [styles.disabled]: disabled,
          [activeClassName ?? '']: isOpenedStatus,
          [styles.noSearchOption]: noSearchOption && isOpenedStatus,
          [styles.error]: !!errorMessage,
        },
        className,
      )}
      ref={outlierRef}
      onClick={handleChangeVisibility}
      aria-disabled={disabled}
    >
      {isSearchable && isOpenedStatus && (
        <input
          ref={inputRef}
          type="text"
          className={cn(styles.searchInput, {
            [styles.nonSearchOption]: noSearchOption,
          })}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={onChangeInput}
        />
      )}
      <div
        className={cn(styles.select, {
          [styles.placeholder]: !value?.label && !defaultValue,
        })}
        role="select"
      >
        <p>{label}</p>
        {!withoutArrow && <i className={cn('icon-down-arrow', styles.icon)} />}
      </div>
      {isOpenedStatus && (
        <ul ref={wrapperRef} className={styles.optionsGroup}>
          {filteredData?.length ? (
            filteredData.map((item, index, array) => {
              const labelIsString = typeof item.label === 'string';
              return (
                <li
                  key={item.value}
                  className={cn({ [styles.option]: !renderItem })}
                  onClick={(e) => {
                    handleItemClick(e, item);
                  }}
                  value={item.value}
                >
                  {!!renderItem
                    ? renderItem(item, index, array)
                    : labelIsString
                      ? (item.label as string)
                      : item.label}
                </li>
              );
            })
          ) : (
            <li className={cn({ [styles.option]: !renderItem })}>
              No selectable options
            </li>
          )}
        </ul>
      )}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
};

export default Select;
