declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';

  export type IconProps = SVGProps<SVGSVGElement> & {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  };

  export type Icon = FC<IconProps>;

  export const Globe: Icon;
  export const Server: Icon;
  export const Database: Icon;
  export const HardDrive: Icon;
  export const Layers: Icon;
  export const Cloud: Icon;
  export const Play: Icon;
  export const RotateCcw: Icon;
  export const Cpu: Icon;
}
