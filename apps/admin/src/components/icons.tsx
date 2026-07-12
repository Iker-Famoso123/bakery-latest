import type { SVGProps } from 'react';

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
      {...props}
    />
  );
}

export const IconAvisos = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h3l4 3V7L7 10H4a1 1 0 0 0-1 1Z" />
    <path d="M15 8a4 4 0 0 1 0 8" />
  </Icon>
);

export const IconMenu = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 13a8 4 0 0 1 16 0v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
    <path d="M8 13v3M12 12v4M16 13v3" />
  </Icon>
);

export const IconUsuarios = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" />
  </Icon>
);

export const IconAjustes = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Icon>
);

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconTrash = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12" />
  </Icon>
);

export const IconEdit = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M13.5 6.5l3 3" />
  </Icon>
);

export const IconLogout = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M15 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3" />
    <path d="M10 12H3M6 8l-4 4 4 4" />
  </Icon>
);

export const IconCalendar = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </Icon>
);

export const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M12 17v5M8 4h8l-1 6 3 3H6l3-3-1-6Z" />
  </Icon>
);

export const IconGrip = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </Icon>
);

export const IconX = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const IconInfinity = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 9a3 3 0 1 0 0 6c2 0 3-2 6-3 3-1 4-3 6-3a3 3 0 1 1 0 6c-2 0-3-2-6-3-3-1-4-3-6-3Z" />
  </Icon>
);
