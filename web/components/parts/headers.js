import Head from "next/head";

export default function Header(props) {
    return (
        <Head>
            <title>Whizz Player - {props.title}</title>
            <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/icons/apple-touch-icon.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/icons/favicon-32x32.png"
            />
            <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/icons/favicon-16x16.png"
            />
            <link rel="manifest" href="/icons/site.webmanifest" />
            <link
                rel="mask-icon"
                href="/icons/safari-pinned-tab.svg"
                color="#343a40"
            />
            <link rel="shortcut icon" href="/icons/favicon.ico" />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta
                name="msapplication-config"
                content="/icons/browserconfig.xml"
            />
            <meta name="theme-color" content="#ffffff"></meta>
        </Head>
    );
}
