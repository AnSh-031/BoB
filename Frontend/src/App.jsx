import Dashboard from "./Components/Dashboard";

function App() {
    return (
        <div style={appStyles.appWrapper}>
            <div style={appStyles.appMainframe}>
                <header style={appStyles.appHeader}>
                    <h1 style={appStyles.brandTitle}>Terminal Dashboard</h1>
                </header>
                <Dashboard />
            </div>
        </div>
    );
}

const appStyles = {
    appWrapper: {
        backgroundColor: "#f1f5f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "4rem 2rem",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box",
    },
    appMainframe: {
        width: "100%",
        maxWidth: "1000px",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    appHeader: {
        borderBottom: "1px solid #cbd5e1",
        paddingBottom: "0.75rem",
        marginBottom: "0.5rem",
    },
    brandTitle: {
        fontSize: "1.35rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: 0,
    }
};

export default App;