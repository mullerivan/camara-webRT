json.array!(@snapshots) do |snapshot|
  json.extract! snapshot, :id, :name, :description, :video_id, :file
  json.url snapshot_url(snapshot, format: :json)
end
