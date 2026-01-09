import { React } from "@webpack/common";
import clsx from "clsx";
import type {PropsWithChildren} from "react";
import DiscordModules from "../../webpack/modules";


export const Sizes = Object.freeze({
    SMALL: "bd-modal-small",
    MEDIUM: "bd-modal-medium",
    LARGE: "bd-modal-large",
    DYNAMIC: ""
});

export const Styles = Object.freeze({
    STANDARD: "bd-modal-standard",
    CUSTOM: ""
});

type RootProps = PropsWithChildren<{
    className?: string;
    transitionState?: number;
    size?: typeof Sizes[keyof typeof Sizes];
    style?: typeof Styles[keyof typeof Styles];
}>;

export default function ModalRoot({className, transitionState, children, size = Sizes.DYNAMIC, style = Styles.CUSTOM}: RootProps) {
    const {Anims, ReactSpring: Spring, FocusLock} = DiscordModules;
    const visible = transitionState == 0 || transitionState == 1; // 300 ms

    const preferences: any = React.useContext(DiscordModules.AccessibilityContext ?? {});
    const reducedMotion = preferences?.reducedMotion?.enabled ?? document.documentElement?.classList.contains("reduce-motion");

    const springStyles = DiscordModules.ReactSpring.useSpring({
        opacity: visible ? 1 : 0,
        transform: visible || reducedMotion ? "scale(1)" : "scale(0.7)",
        config: {
            duration: visible ? 300 : 100,
            easing: visible ? Anims.Easing.inOut(Anims.Easing.back()) : Anims.Easing.quad,
            clamp: true
        }
    });

    return <FocusLock disableTrack={true}>
        <Spring.animated.div
                className={clsx("bd-modal-root", size, className, style)}
                style={springStyles}
            >
        {children}
    </Spring.animated.div>
    </FocusLock>;
}

ModalRoot.Sizes = Sizes;
ModalRoot.Styles = Styles;