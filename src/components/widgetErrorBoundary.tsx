//@ts-nocheck
import React from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: false,
            didLog: false,
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        console.log("ERROR BOUNDARY ACTIVATED", error);
        return {
            hasError: true,
        };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            errorMessage: errorInfo,
        });

        const data = {
            // @ts-ignore
            widget: this.props.widgetType,
            errorMessage: errorInfo,
        };

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };

        fetch("/api/logUiError", options)
            .then((response) => response.json())
            .then((data) => {
                if (data === true) {
                    this.setState({ didLog: true });
                }
            });
    }

    render() {
        // const p = this.props
        const s = this.state; // @ts-ignore
        if (this.state.hasError) {
            // Add logic for development mode vs live.
            return (
                <div>
                    <b>Error rendering: {this.props.widgetType} </b>
                    <br />
                    {this.state.errorMessage !== false ? (
                        s.errorMessage.componentStack
                    ) : (
                        <></>
                    )}
                    {s.didLog === true ? (
                        <>
                            <br />
                            <b>"Error succesfuly logged by server."</b>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
