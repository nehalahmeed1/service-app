export default function ProviderOnboarding() {
  return (
    <div style={{ padding: 40, maxWidth: 600, margin: "0 auto" }}>
      <h2>Provider Registration</h2>

      <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label>
          Full Name
          <input type="text" />
        </label>

        <label>
          Service
          <select>
            <option>Select Service</option>
            <option>Electrician</option>
            <option>Plumber</option>
          </select>
        </label>

        <label>
          Area / Location
          <input type="text" />
        </label>

        <label>
          Phone Number
          <input type="text" />
        </label>

        <button type="submit">Submit Registration</button>
      </form>
    </div>
  );
}
