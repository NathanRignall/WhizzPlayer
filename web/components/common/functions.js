import { useState, useEffect } from "react";

import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

export const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }

    return res.json();
};

const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/lookup";

export const TrackSearch = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [singleSelections, setSingleSelections] = useState([]);

    useEffect(() => {
        if (singleSelections.length > 0) {
            setFieldValue(name, singleSelections[0].value);
        }
    }, [singleSelections]);

    const handleSearch = (query) => {
        setIsLoading(true);

        axios
            .get(`${SEARCH_URI}?search=${query}`)
            .then((response) => {
                console.log(response.data.payload);

                const options = response.data.payload.map((i) => ({
                    TrackName: i.TrackName,
                }));

                console.log(options);

                setOptions(options);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    console.log("error with response");
                } else if (error.request) {
                    console.log("no response");
                } else {
                    console.log("axios error");
                }
                setOptions(options);
                setIsLoading(false);
            });
    };

    const filterBy = () => true;

    return (
        <AsyncTypeahead
            id="tracks"
            multiple={false}
            filterBy={filterBy}
            isLoading={isLoading}
            labelKey="TrackName"
            minLength={2}
            onSearch={handleSearch}
            options={options}
            onChange={setSingleSelections}
            selected={singleSelections}
            placeholder="Enter Track Name..."
            renderMenuItemChildren={(option, props) => (
                <span>{option.TrackName}</span>
            )}
        />
    );
};
