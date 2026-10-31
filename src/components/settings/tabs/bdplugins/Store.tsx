import "./Store.css";
import { Margins } from "@components/margins";
import { Modal, openModal, React, Select, TextInput, useState } from "@webpack/common";
import PluginStore from "@bd/core/pluginstore";
import PluginStoreCard from "./StoreCard";
import Paginator from "@bd/ui/misc/paginator";
import { classes } from "@utils/misc";
import pluginmanager from "@bd/core/pluginmanager";
import { Paragraph } from "@components/Paragraph";
import { RenderModalProps } from "@vencord/discord-types";

const pageSize = 20;

enum SortType {
    Downloads = "downloads",
    Author = "author",
    Likes = "likes",
    NotInstalled = "installed",
    Modified = "modified",
    ReleaseDate = "releaseDate",
    Name = "name"
}

function StoreModal(props: RenderModalProps) {
    const [page, setPage] = useState(0);
    const [sort, setSort] = useState(SortType.Downloads);
    const [search, setSearch] = useState("");

    const searched = search.trim().toLowerCase();
    let plugins = Object.values(PluginStore.plugins).filter(plugin => (
        plugin.name.toLowerCase().includes(searched) ||
        plugin.description.toLowerCase().includes(searched)
    ));

    if (sort === SortType.NotInstalled) {
        plugins = plugins.filter(plugin => !pluginmanager.getPlugin(plugin.file_name));
    } else {
        plugins.sort((a, b) => {
            switch (sort) {
                case SortType.Downloads:
                    return b.downloads - a.downloads;
                case SortType.Author:
                    return a.author.display_name.localeCompare(b.author.display_name);
                case SortType.Likes:
                    return b.likes - a.likes;
                case SortType.Modified:
                    return new Date(b.latest_release_date).getTime() - new Date(a.latest_release_date).getTime();
                case SortType.Name:
                    return a.name.localeCompare(b.name);
                case SortType.ReleaseDate:
                    return new Date(b.initial_release_date).getTime() - new Date(a.initial_release_date).getTime();
            }
        });
    }

    const wrapper = React.useRef<HTMLDivElement>(null);

    return (
        <Modal {...props} size="lg" title="BetterDiscord plugin store">
            <div className={classes(Margins.bottom20, "vc-plugins-filter-controls")}>
                <TextInput
                    autoFocus value={search}
                    placeholder="Search for a plugin..."
                    onChange={(query: string) => setSearch(query)}
                />
                <Select
                    options={[
                        { label: "Most Downloads", value: SortType.Downloads, default: true },
                        { label: "Not Installed", value: SortType.NotInstalled },
                        { label: "Most Likes", value: SortType.Likes },
                        { label: "Last Updated", value: SortType.Modified },
                        { label: "Newest", value: SortType.ReleaseDate },
                        { label: "Author", value: SortType.Author },
                        { label: "Name", value: SortType.Name }
                    ]}
                    serialize={String}
                    select={(type) => setSort(type)}
                    isSelected={v => v === sort}
                    closeOnSelect={true}
                />
            </div>

            <div className="bd-plugin-store-cards" ref={wrapper}>
                {plugins.slice(page * pageSize, page * pageSize + pageSize).map(plugin => (
                    <PluginStoreCard key={plugin.id} plugin={plugin} />
                ))}
            </div>

            {plugins.length === 0 && (
                <Paragraph>No plugins match search</Paragraph>
            )}

            <Paginator
                currentPage={page}
                length={plugins.length}
                pageSize={pageSize}
                maxVisible={9}
                onPageChange={(newPage) => {
                    setPage(newPage);
                    wrapper.current?.closest('[class*="scrollerBase"]')?.scrollTo({ top: 0, behavior: "smooth" });
                }}
            />
        </Modal>
    );
}

export function openPluginStore() {
    openModal(modalProps => (
        <StoreModal {...modalProps} />
    ));
}