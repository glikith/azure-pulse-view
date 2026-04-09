
## Plan: Fix Dashboard Flickering, Metric Formatting, and Resources Filtering

### Issues Identified

1. **Dashboard flickering every ~1s**: The polling interval is set to `5000ms` (5s), but the `fetchResources` dispatch in the polling loop triggers a Redux state update that causes `resources` to change, which in turn re-triggers the metrics useEffect (step 4), creating a cascade of re-renders. Additionally, the `loading` state flips to `true` on every fetch, causing the entire UI to flash between loading and data states.

2. **Memory/Network showing raw bytes (10-digit numbers)**: Memory is displayed with `unit: 'Percent'` on the dashboard card (line 63) but the actual value from Azure is in Bytes (~308 million). Network traffic uses `unit: 'MBps'` but the value is also raw bytes (~60K). The `formatMetricValue` function handles Bytes correctly, but the dashboard hardcodes wrong units.

3. **Resources tab shows all Azure resources**: No filtering is applied -- it shows disks, NICs, NSGs, SSH keys, etc. instead of just VMs. The resource groups dropdown also shows all RGs.

---

### Step 1: Fix Dashboard Flickering

**File: `src/store/slices/azureResourcesSlice.ts`**
- Stop setting `loading = true` on every poll fetch. Only show loading on the initial fetch (when resources array is empty). This prevents the UI from flashing loading skeletons on every poll cycle.

**File: `src/store/slices/azureMetricsSlice.ts`**
- Same fix: only set `loading = true` when `data` is empty. Subsequent fetches should update data silently.

**File: `src/hooks/useAzureDataLoader.ts`**
- Increase default polling interval reference or ensure the polling doesn't re-dispatch resource fetches that cascade into metric re-fetches. Stabilize the `resources` dependency in the polling effect by using a ref.

### Step 2: Fix Memory and Network Display Values

**File: `src/pages/DashboardPage.tsx`**
- Line 63: Change memory metric unit from `'Percent'` to `'Bytes'` so `formatMetricValue` correctly formats it as MB/GB.
- Line 73: Change network metric unit from `'MBps'` to `'Bytes'` so it formats as KB/MB.
- The memory chart Y-axis (line 128) should also remove the `domain={[0, 100]}` constraint since values are in bytes, not percentages.

### Step 3: Filter Resources to VMs Only

**File: `src/pages/ResourcesPage.tsx`**
- Filter displayed resources to only show `Microsoft.Compute/virtualMachines` by default.
- Filter resource groups to only show those that contain VMs.

**File: `src/pages/DashboardPage.tsx`**
- Apply the same VM-only filter to the resource table at the bottom of the dashboard.
- Update the resource distribution pie chart to show VM-specific breakdown or just VM count.

**File: `src/components/layout/TopHeader.tsx`**
- Filter the resource group dropdown to only show RGs that contain at least one VM resource.

---

### Technical Details

- The flickering fix works by distinguishing "initial load" from "background refresh" in Redux reducers using a conditional: `if (state.resources.length === 0) state.loading = true`
- A `useRef` for resources in the polling effect prevents cascading re-fetches
- The VM filter constant: `'Microsoft.Compute/virtualMachines'`
- Memory values (~308M bytes) will display as "293.82 MB" after the unit fix
- Network values (~60K bytes) will display as "60,000 B" or similar
