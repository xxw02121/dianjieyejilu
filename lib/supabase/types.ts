export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    display_name: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    display_name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    display_name?: string | null
                    created_at?: string
                }
            }
            experiment_records: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    date: string
                    research_type: 'des_electrolyte' | 'hydrogel' | 'other' | null
                    tags: string[] | null
                    visibility: 'private' | 'shared'
                    share_token: string | null
                    share_expires_at: string | null
                    share_password: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    date?: string
                    research_type?: 'des_electrolyte' | 'hydrogel' | 'other' | null
                    tags?: string[] | null
                    visibility?: 'private' | 'shared'
                    share_token?: string | null
                    share_expires_at?: string | null
                    share_password?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    date?: string
                    research_type?: 'des_electrolyte' | 'hydrogel' | 'other' | null
                    tags?: string[] | null
                    visibility?: 'private' | 'shared'
                    share_token?: string | null
                    share_expires_at?: string | null
                    share_password?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            des_formulas: {
                Row: {
                    id: string
                    record_id: string
                    hba_name: string | null
                    hba_purity: string | null
                    hba_supplier: string | null
                    hbd_name: string | null
                    hbd_purity: string | null
                    hbd_supplier: string | null
                    molar_ratio: string | null
                    water_content: number | null
                    water_content_unit: 'wt%' | 'mol%' | null
                    salt_name: string | null
                    salt_concentration: string | null
                    additives: Json | null
                    preparation_temp: string | null
                    stirring_time: string | null
                    appearance: string | null
                    viscosity: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    record_id: string
                    hba_name?: string | null
                    hba_purity?: string | null
                    hba_supplier?: string | null
                    hbd_name?: string | null
                    hbd_purity?: string | null
                    hbd_supplier?: string | null
                    molar_ratio?: string | null
                    water_content?: number | null
                    water_content_unit?: 'wt%' | 'mol%' | null
                    salt_name?: string | null
                    salt_concentration?: string | null
                    additives?: Json | null
                    preparation_temp?: string | null
                    stirring_time?: string | null
                    appearance?: string | null
                    viscosity?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    record_id?: string
                    hba_name?: string | null
                    hba_purity?: string | null
                    hba_supplier?: string | null
                    hbd_name?: string | null
                    hbd_purity?: string | null
                    hbd_supplier?: string | null
                    molar_ratio?: string | null
                    water_content?: number | null
                    water_content_unit?: 'wt%' | 'mol%' | null
                    salt_name?: string | null
                    salt_concentration?: string | null
                    additives?: Json | null
                    preparation_temp?: string | null
                    stirring_time?: string | null
                    appearance?: string | null
                    viscosity?: string | null
                    notes?: string | null
                }
            }
            hydrogel_formulas: {
                Row: {
                    id: string
                    record_id: string
                    polymer_type: string | null
                    polymer_content: string | null
                    crosslink_method: string | null
                    crosslink_agent: string | null
                    solvent_system: string | null
                    salt_concentration: string | null
                    preparation_steps: string | null
                    gel_properties: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    record_id: string
                    polymer_type?: string | null
                    polymer_content?: string | null
                    crosslink_method?: string | null
                    crosslink_agent?: string | null
                    solvent_system?: string | null
                    salt_concentration?: string | null
                    preparation_steps?: string | null
                    gel_properties?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    record_id?: string
                    polymer_type?: string | null
                    polymer_content?: string | null
                    crosslink_method?: string | null
                    crosslink_agent?: string | null
                    solvent_system?: string | null
                    salt_concentration?: string | null
                    preparation_steps?: string | null
                    gel_properties?: string | null
                    notes?: string | null
                }
            }
            test_conditions: {
                Row: {
                    id: string
                    record_id: string
                    battery_type: string | null
                    cathode_material: string | null
                    cathode_loading: string | null
                    anode_material: string | null
                    separator: string | null
                    electrolyte_amount: string | null
                    test_items: Json | null
                    observations: string | null
                }
                Insert: {
                    id?: string
                    record_id: string
                    battery_type?: string | null
                    cathode_material?: string | null
                    cathode_loading?: string | null
                    anode_material?: string | null
                    separator?: string | null
                    electrolyte_amount?: string | null
                    test_items?: Json | null
                    observations?: string | null
                }
                Update: {
                    id?: string
                    record_id?: string
                    battery_type?: string | null
                    cathode_material?: string | null
                    cathode_loading?: string | null
                    anode_material?: string | null
                    separator?: string | null
                    electrolyte_amount?: string | null
                    test_items?: Json | null
                    observations?: string | null
                }
            }
            test_results: {
                Row: {
                    id: string
                    record_id: string
                    capacity: number | null
                    retention: number | null
                    coulombic_efficiency: number | null
                    conclusion: string
                    failure_reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    record_id: string
                    capacity?: number | null
                    retention?: number | null
                    coulombic_efficiency?: number | null
                    conclusion: string
                    failure_reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    record_id?: string
                    capacity?: number | null
                    retention?: number | null
                    coulombic_efficiency?: number | null
                    conclusion?: string
                    failure_reason?: string | null
                    created_at?: string
                }
            }
            attachments: {
                Row: {
                    id: string
                    record_id: string
                    file_name: string
                    file_path: string
                    file_type: string | null
                    file_size: number | null
                    uploaded_at: string
                }
                Insert: {
                    id?: string
                    record_id: string
                    file_name: string
                    file_path: string
                    file_type?: string | null
                    file_size?: number | null
                    uploaded_at?: string
                }
                Update: {
                    id?: string
                    record_id?: string
                    file_name?: string
                    file_path?: string
                    file_type?: string | null
                    file_size?: number | null
                    uploaded_at?: string
                }
            }
        }
    }
}
