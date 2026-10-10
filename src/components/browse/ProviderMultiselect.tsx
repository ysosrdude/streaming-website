import { useProviderSelection } from '../../context/ProviderSelectionContext'

export function ProviderMultiselect() {
  const { providers, selectedIds, isSelected, toggle, selectAll } =
    useProviderSelection()

  return (
    <div className="provider-select">
      <div className="provider-select__header">
        <span className="provider-select__label">Feeds</span>
        {selectedIds.length < providers.length ? (
          <button type="button" className="provider-select__action" onClick={selectAll}>
            Select all
          </button>
        ) : null}
      </div>
      <ul className="provider-select__list">
        {providers.map((provider) => {
          const checked = isSelected(provider.id)
          return (
            <li key={provider.id}>
              <label className="provider-option">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(provider.id)}
                />
                <span>{provider.name}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
