import Logger from "../core/logger";
import {React} from "@webpack/common";
import type {PropsWithChildren, ReactNode} from "react";
import { LazyComponent } from "@utils/lazyReact";


export type ErrorBoundaryProps = PropsWithChildren<{
    id?: string;
    name?: string;
    hideError?: boolean;
    fallback?: ReactNode;
    onError?(e: Error): void;
}>;

const ErrorBoundary = LazyComponent(() => {
    class Boundary extends React.Component<ErrorBoundaryProps, {hasError: boolean;}> {
        /**
         * Creates an error boundary with optional fallbacks and debug info.
         * @param {object} props
         * @param {ReactElement[]} [props.children] - An optional id for debugging purposes
         * @param {string} [props.id="Unknown"] - An optional id for debugging purposes
         * @param {string} [props.name="Unknown"] - An optional name for debugging purposes
         * @param {boolean} [props.hideError=false] - Whether to hide the default error message in the ui (never shown if there is a fallback)
         * @param {ReactElement} [props.fallback] - A fallback to show on error
         * @param {function} [props.onError] - A callback called with the error when it happens
         */
        constructor(props: ErrorBoundaryProps) {
            super(props);
            this.state = {hasError: false};
        }
    
        componentDidCatch(error: Error) {
            this.setState({hasError: true});
            Logger.stacktrace("ErrorBoundary", `React error detected for {name: ${this.props.name ?? "Unknown"}, id: ${this.props.id ?? "Unknown"}}`, error);
            if (typeof this.props.onError === "function") this.props.onError(error);
        }
    
        render() {
            if (this.state.hasError && this.props.fallback) {
                return this.props.fallback;
            }
            else if (this.state.hasError && !this.props.hideError) {
                return <div className="react-error">
                    There was an unexpected Error. Open console for more details.
                </div>;
            }
            return this.props.children;
        }
    }
    
    const originalRender = Boundary.prototype.render;
    Object.defineProperty(Boundary.prototype, "render", {
        enumerable: false,
        configurable: false,
        set: function () {Logger.warn("ErrorBoundary", "Addon policy for plugins https://docs.betterdiscord.app/plugins/introduction/guidelines#scope");},
        get: () => originalRender
    });

    return Boundary;
});

export default ErrorBoundary;