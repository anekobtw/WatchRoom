import { Share2 } from "lucide-react";

type User = {
  clientId: string;
  name: string;
  admin: boolean;
};

export default function PeopleSidebar({ users }: { users?: User[] }) {
  return (
    <aside className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-5 text-s text-foreground/60">
          {users?.length ?? 0} watching
        </div>

        <div className="space-y-3">
          {users?.map((user) => (
            <div key={user.clientId} className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-foreground">
                {user.name?.[0]?.toUpperCase()}

                {user.admin && (
                  <span className="absolute -top-1 -right-1 text-[10px]">
                    👑
                  </span>
                )}

                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
              </div>

              <span className="truncate text-sm text-foreground/80">
                {user.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-surface-2 hover:bg-primary-hover px-4 py-2 text-sm transition duration-200 w-full">
          <Share2 size={18} />
          Share
        </button>
      </div>
    </aside>
  );
}
