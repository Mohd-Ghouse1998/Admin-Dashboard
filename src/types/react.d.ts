
import React from 'react';

declare module 'react' {
  interface AnchorElementProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children?: React.ReactNode;
  }
}
