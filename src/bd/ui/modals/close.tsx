import {React} from "@webpack/common";

import Button from "../base/button";


export default function CloseButton({onClick}: {onClick?: () => void;}) {
    return <Button
        className="bd-close-button"
        size={Button.Sizes.ICON}
        look={Button.Looks.BLANK}
        color={Button.Colors.TRANSPARENT}
        onClick={onClick}
    >
        X
        {/* <XIcon size="24px" /> */}
    </Button>;
}