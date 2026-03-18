function CollapsibleSection({
  title,
  isMobileLayout,
  isExpanded,
  onToggle,
  children
}) {
  return (
    <div className={`collapsible-card${isMobileLayout ? " mobile-collapsible" : ""}`}>
      {isMobileLayout ? (
        <button
          type="button"
          className="collapsible-toggle"
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          <span>{title}</span>
          <span className={`collapsible-chevron${isExpanded ? " expanded" : ""}`}>^</span>
        </button>
      ) : null}
      {!isMobileLayout || isExpanded ? children : null}
    </div>
  );
}

export default CollapsibleSection;
