import { BranchIcon, CheckoutIcon } from "./icons";

export type HomeStatusProps = {
  branch: string;
};

export default function HomeStatus({ branch }: HomeStatusProps) {
  return (
    <div className="home-status">
      <span className="home-status-chip">
        <CheckoutIcon className="home-status-icon" />
        <span className="home-status-value">Current checkout</span>
      </span>
      <span className="home-status-chip">
        <BranchIcon className="home-status-icon" />
        <span className="home-status-value">{branch}</span>
      </span>
    </div>
  );
}
