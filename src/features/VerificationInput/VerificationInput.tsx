import React from 'react';
import AuthCode from 'react-auth-code-input';

import styles from './VerificationInput.module.scss';
import cn from 'classnames';

interface VerificationInputProps {
  length?: number;
  error?: boolean;
  onChange: (verificationCode: string) => void;
}

const VerificationInput: React.FC<VerificationInputProps> = (props) => {
  const { length = 5, error, onChange } = props;

  return (
    <AuthCode
      containerClassName={styles.container}
      inputClassName={cn(styles.input, { [styles.error]: error })}
      allowedCharacters="numeric"
      length={length}
      onChange={onChange}
    />
  );
};

export default VerificationInput;
