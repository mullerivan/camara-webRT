json.array!(@projects) do |project|
  json.extract! project, :id, :name, :description, :begin, :end, :place
  json.url project_url(project, format: :json)
end
