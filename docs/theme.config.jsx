export default {
  darkMode: false,
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter();
    const { frontMatter } = useConfig();
    const url =
      "https://my-app.com" +
      (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    return (
      <>
        <meta property="og:url" content={url} />
        <meta
          property="og:title"
          content={frontMatter.title || "Anthropic Bedrock"}
        />
        <meta
          property="og:description"
          content={
            frontMatter.description ||
            "Anthropic Bedrock are SDKs for Anthropic's models on AWS Bedrock"
          }
        />
      </>
    );
  },
  logo: (
    <svg
      width="143"
      height="16"
      viewBox="0 0 143 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_267_13832)">
        <path
          d="M29.1201 11.099L22.1351 0.27H18.3655V15.74H21.5808V4.91101L28.5657 15.74H32.3353V0.27H29.1201V11.099Z"
          fill="#181818"
        />
        <path
          d="M34.9948 3.2535H40.2061V15.74H43.5325V3.2535H48.7439V0.27H34.9948V3.2535Z"
          fill="#181818"
        />
        <path
          d="M62.057 6.4359H54.7395V0.27H51.4134V15.74H54.7395V9.4194H62.057V15.74H65.3832V0.27H62.057V6.4359Z"
          fill="#181818"
        />
        <path
          d="M72.8149 3.2535H76.9182C78.5595 3.2535 79.4246 3.85019 79.4246 4.9773C79.4246 6.1044 78.5595 6.7011 76.9182 6.7011H72.8149V3.2535ZM82.7516 4.9773C82.7516 2.0601 80.6001 0.27 77.0735 0.27H69.4878V15.74H72.8149V9.68459H76.5187L79.846 15.74H83.528L79.8438 9.22338C81.6929 8.51506 82.7516 7.02353 82.7516 4.9773Z"
          fill="#181818"
        />
        <path
          d="M92.9436 12.9061C90.3273 12.9061 88.7309 11.0497 88.7309 8.02209C88.7309 4.95027 90.3273 3.09393 92.9436 3.09393C95.5377 3.09393 97.1119 4.95027 97.1119 8.02209C97.1119 11.0497 95.5377 12.9061 92.9436 12.9061ZM92.9436 0C88.4648 0 85.2942 3.31492 85.2942 8.02209C85.2942 12.6851 88.4648 16 92.9436 16C97.4002 16 100.549 12.6851 100.549 8.02209C100.549 3.31492 97.4002 0 92.9436 0Z"
          fill="#181818"
        />
        <path
          d="M111.092 7.1431H106.988V3.2535H111.092C112.734 3.2535 113.599 3.91651 113.599 5.1983C113.599 6.4801 112.734 7.1431 111.092 7.1431ZM111.247 0.27H103.66V15.74H106.988V10.1266H111.247C114.775 10.1266 116.927 8.2702 116.927 5.1983C116.927 2.12639 114.775 0.27 111.247 0.27Z"
          fill="#181818"
        />
        <path
          d="M139.452 10.5414C138.876 12.0442 137.723 12.9061 136.148 12.9061C133.532 12.9061 131.935 11.0497 131.935 8.02209C131.935 4.95027 133.532 3.09393 136.148 3.09393C137.723 3.09393 138.876 3.9558 139.452 5.45856H142.978C142.113 2.14365 139.519 0 136.148 0C131.669 0 128.498 3.31492 128.498 8.02209C128.498 12.6851 131.669 16 136.148 16C139.541 16 142.135 13.8343 143 10.5414H139.452Z"
          fill="#181818"
        />
        <path
          d="M118.252 0.27L124.442 15.74H127.836L121.646 0.27H118.252Z"
          fill="#181818"
        />
        <path
          d="M5.84545 9.6183L7.96341 4.18169L10.0814 9.6183H5.84545ZM6.18883 0.27L0 15.74H3.46042L4.72613 12.4913H11.2009L12.4664 15.74H15.9268L9.73798 0.27H6.18883Z"
          fill="#181818"
        />
      </g>
      <defs>
        <clipPath id="clip0_267_13832">
          <rect width="143" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  project: {
    link: "https://github.com/mustafaaljadery/anthropic-bedrock",
  },
  primaryHue: 19,
  primarySaturation: 47,
  footer: {
    text: (
      <span className="text-sm">
        MIT {new Date().getFullYear()} ©{" "}
        <a
          className="text-blue-700 hover:opacity-80"
          href="https://maxaljadery.com"
          target="_blank"
        >
          Mustafa Aljadery
        </a>{" "}
        &{" "}
        <a
          className="text-blue-700 hover:opacity-80"
          href="https://stanford.edu/~sidshr/"
          target="_blank"
        >
          Siddharth Sharma
        </a>
        . Models are by{" "}
        <a
          className="text-blue-700 hover:opacity-80"
          href="https://www.anthropic.com/"
          target="_blank"
        >
          Anthropic
        </a>
        , served on{" "}
        <a
          className="text-blue-700 hover:opacity-80"
          href="https://aws.amazon.com/bedrock/"
          target="_blank"
        >
          AWS Bedrock
        </a>
        .
      </span>
    ),
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Anthropic Bedrock",
    };
  },
};
