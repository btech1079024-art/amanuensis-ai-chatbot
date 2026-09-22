import "./UpgradeModal.css";
import { useState } from "react";
import { IconClose, IconCheck } from "./icons.jsx";

const PLANS = [
    {
        id: "free",
        name: "Free",
        tagline: "Meet Amanuensis",
        price: "₹0",
        period: "",
        features: [
            "Unlimited chats",
            "Voice input & voice output",
            "4 color themes",
            "Chat history saved",
        ],
        current: true,
    },
    {
        id: "pro",
        name: "Pro",
        tagline: "For everyday use",
        price: "₹99",
        period: "/ month",
        features: [
            "Everything in Free, and:",
            "Longer conversation memory",
            "Priority support",
            "Early access to new features",
        ],
        highlight: true,
    },
    {
        id: "max",
        name: "Max",
        tagline: "Higher limits",
        price: "₹199",
        period: "/ month",
        features: [
            "Everything in Pro, and:",
            "Unlimited regenerations",
            "Dedicated support",
            "Early beta access",
        ],
    },
];

function UpgradeModal({ onClose }) {
    const [notice, setNotice] = useState(false);

    const handleSelect = () => {
        setNotice(true);
        setTimeout(() => setNotice(false), 3500);
    };

    return (
        <div className="upgradeOverlay" onClick={onClose}>
            <div className="upgradeCard" onClick={(e) => e.stopPropagation()}>
                <div className="upgradeHeader">
                    <h2>Upgrade</h2>
                    <button className="upgradeClose" onClick={onClose} aria-label="Close">
                        <IconClose size={18} />
                    </button>
                </div>

                {notice && (
                    <div className="upgradeNotice">
                        Payments aren't set up yet — this is just the pricing page for now.
                    </div>
                )}

                <div className="upgradeGrid">
                    {PLANS.map((plan) => (
                        <div key={plan.id} className={`planCard ${plan.highlight ? "planCard--highlight" : ""}`}>
                            <p className="planName">{plan.name}</p>
                            <p className="planTagline">{plan.tagline}</p>
                            <p className="planPrice">
                                {plan.price} <span className="planPeriod">{plan.period}</span>
                            </p>
                            <button
                                className={`planBtn ${plan.highlight ? "planBtn--primary" : ""}`}
                                onClick={plan.current ? undefined : handleSelect}
                                disabled={plan.current}
                            >
                                {plan.current ? "Current plan" : `Get ${plan.name} plan`}
                            </button>
                            <ul className="planFeatures">
                                {plan.features.map((f, i) => (
                                    <li key={i}>
                                        <IconCheck size={13} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UpgradeModal;