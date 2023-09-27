
export interface Traffic {
    items: TrafficItem[],
    api_info: APIStatus
}

export interface APIStatus {
    status: string
}

export interface TrafficItem {
    timestamp: string,
    cameras: CameraMetadata[]
}

export interface CameraWithLoc extends CameraMetadata {
    address: string,
    route: string,
    neighborhood: string,
    region: string
}

export interface CameraMetadata {
    timestamp: string,
    image: string,
    location: Coordinate,
    camera_id: string,
    image_metadata: ImageMetadata
}

export interface ImageMetadata {
    height: number,
    width: number,
    md: string
}

export interface Coordinate {
    longitude: number,
    latitude: number
}

export interface GoogleResponse {
    plus_code: {
        compound_code: string,
        global_code: string
    },
    results: {
        address_components: AddrComponents[],
        formatted_address: string,
        types: string[]
    }[],
    error_message?: string,
    status: string
}

export interface AddrComponents {
    long_name: string,
    short_name: string,
    types: string[]
}