import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md ">
                <AppLogoIcon className="size-12 fill-current text-blue-500 dark:text-blue-500 mt-2 ml-1" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    NetGP
                </span>
            </div>
        </>
    );
}
